import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "react-router";
import { useLoaderData, data, useFetcher } from "react-router";
import { useStateFilter } from "~/components/organisms/student";
import { StudentCards, TierSelector } from "~/components/molecules/student";
import { getAuthenticator } from "~/auth/authenticator.server";
import { SubTitle, Description } from "~/components/atoms/typography";
import { getRouteSensei } from "./$username";
import { getAllStudents } from "~/models/student";
import { getRecruitedStudents, upsertRecruitedStudent, removeRecruitedStudent } from "~/models/recruited-student";
import { MinusCircleIcon, IdentificationIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import { useRef, useEffect, useState } from "react";
import { Button, Toggle } from "~/components/atoms/form";

export const loader = async ({ context, request, params }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);

  const sensei = await getRouteSensei(env, params);

  const recruitedStudents = await getRecruitedStudents(env, sensei.id);
  const recruitedStudentTiers = recruitedStudents.reduce((acc, { studentUid, tier }) => {
    acc[studentUid] = tier;
    return acc;
  }, {} as Record<string, number>);

  return {
    me: currentUser?.username === sensei.username,
    allStudents: await getAllStudents(env),
    recruitedStudentTiers,
  };
};

export const meta: MetaFunction = ({ params }) => {
  return [
    { title: `${params.username || ""} - 학생부 | 몰루로그`.trim() },
    { name: "description", content: `${params.username} 선생님이 모집한 학생 목록을 확인해보세요` },
    { name: "og:title", content: `${params.username || ""} - 학생부 | 몰루로그`.trim() },
    { name: "og:description", content: `${params.username} 선생님이 모집한 학생 목록을 확인해보세요` },
  ];
};

export const action = async ({ context, request, params }: ActionFunctionArgs) => {
  const env = context.cloudflare.env;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  if (!currentUser) {
    return data({ error: "Unauthorized" }, { status: 401 });
  }

  const sensei = await getRouteSensei(env, params);
  if (currentUser.username !== sensei.username) {
    return data({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const studentUid = formData.get("studentUid") as string;
  const tier = parseInt(formData.get("tier") as string);

  if (!studentUid) {
    return data({ error: "Student UID is required" }, { status: 400 });
  }

  switch (request.method) {
    case "POST":
      await upsertRecruitedStudent(env, sensei.id, studentUid, tier);
      break;
    case "DELETE":
      await removeRecruitedStudent(env, sensei.id, studentUid);
      break;
    default:
      return data({ error: "Method not allowed" }, { status: 405 });
  }
  return data({ success: true });
};

export default function UserPage() {
  const loaderData = useLoaderData<typeof loader>();
  const { me, allStudents, recruitedStudentTiers } = loaderData;
  const fetcher = useFetcher();

  const studentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastAddedStudentUid = useRef<string | null>(null);

  const [batchAddMode, setBatchAddMode] = useState(false);
  const [batchAddStudents, setBatchAddStudents] = useState<string[]>([]);

  const [StateFilter, filteredStudents] = useStateFilter(allStudents.map((student) => ({
    ...student,
    tier: recruitedStudentTiers[student.uid] ?? student.initialTier,
  })), { useFilter: true, useSort: true, useSearch: true });

  const noOwned = Object.values(recruitedStudentTiers).length === 0;

  const handleAddStudent = (studentUid: string, tier: number, scrollTo: boolean = false) => {
    const formData = new FormData();
    formData.append("studentUid", studentUid);
    formData.append("tier", tier.toString());
    fetcher.submit(formData, { method: "post" });

    if (scrollTo) {
      lastAddedStudentUid.current = studentUid;
    }
  };

  const handleRemoveStudent = (studentUid: string) => {
    const formData = new FormData();
    formData.append("studentUid", studentUid);
    fetcher.submit(formData, { method: "delete" });
  };

  // Scroll to the specific student card when a student is added
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.success && lastAddedStudentUid.current) {
      const studentRef = studentRefs.current[lastAddedStudentUid.current];
      if (studentRef) {
        studentRef.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      lastAddedStudentUid.current = null;
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <>
      {StateFilter}

      <div className="my-8">
        <SubTitle text="모집한 학생" />
        {me && !noOwned && <Description text="학생을 선택해 성장 등급을 수정할 수 있어요." />}
        {noOwned ?
          <div className="my-16 text-center">
            아직 모집한 학생이 없어요
          </div> :
          <StudentCards
            students={filteredStudents.filter(({ uid }) => recruitedStudentTiers[uid]).map(({ uid, name, attackType, defenseType, role, initialTier }) => ({
              uid, name, attackType, defenseType, role, initialTier,
              tier: recruitedStudentTiers[uid],
              popups: [
                ...(me ? [
                  {
                    children: (
                      <TierSelector
                        initialTier={initialTier}
                        currentTier={recruitedStudentTiers[uid]}
                        onTierChange={(tier) => handleAddStudent(uid, tier)}
                      />
                    ),
                  },
                  {
                    Icon: MinusCircleIcon,
                    text: "모집한 학생에서 제외",
                    onClick: () => handleRemoveStudent(uid),
                  },
                ] : []),
                {
                  Icon: IdentificationIcon,
                  text: "학생부 보기",
                  link: `/students/${uid}`,
                },
              ],
            }))}
            onRef={(uid, ref) => studentRefs.current[uid] = ref}
          />
        }
      </div>

      <div className="my-8">
        <SubTitle text="미모집 학생" />
        {me && (
          <>
            <Description text="학생을 선택해 모집 정보를 등록할 수 있어요." />
            <Toggle label="모집한 학생 일괄 등록" initialState={batchAddMode} onChange={setBatchAddMode} />
            {batchAddMode && (
              <div className="mb-2">
                <Button color="primary" onClick={() => {
                  batchAddStudents.forEach((uid) => handleAddStudent(uid, allStudents.find((student) => student.uid === uid)!.initialTier));
                  setBatchAddStudents([]);
                  setBatchAddMode(false);
                }}>선택한 학생 등록</Button>
              </div>
            )}
          </>
        )}
        <StudentCards
          students={filteredStudents.filter(({ uid }) => !recruitedStudentTiers[uid]).map(({ uid, name, attackType, defenseType, role, initialTier }) => ({
            uid, name, attackType, defenseType, role,
            grayscale: true,
            border: batchAddMode ? (batchAddStudents.includes(uid) ? "blue" : "gray") : undefined,
            popups: batchAddMode ? [] : [
              ...(me ? [
                {
                  Icon: PlusCircleIcon,
                  text: "모집한 학생에 추가",
                  onClick: () => handleAddStudent(uid, initialTier, true),
                },
              ] : []),
              {
                Icon: IdentificationIcon,
                text: "학생부 보기",
                link: `/students/${uid}`,
              },
            ],
          }))}
          onRef={(uid, ref) => studentRefs.current[uid] = ref}
          onSelect={batchAddMode ? (uid: string) => {
            setBatchAddStudents((prev) => {
              if (prev.includes(uid)) {
                return prev.filter((each) => each !== uid);
              }
              return [...prev, uid];
            });
          } : undefined}
        />
      </div>
    </>
  );
}
