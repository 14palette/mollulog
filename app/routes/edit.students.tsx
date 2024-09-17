import { ActionFunctionArgs, json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/cloudflare";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { FloatingButton, Toggle } from "~/components/atoms/form";
import { useToast } from "~/components/atoms/notification";
import { EditTier } from "~/components/atoms/student";
import { Title } from "~/components/atoms/typography";
import { useStateFilter } from "~/components/organisms/student";
import { Env } from "~/env.server";
import { studentImageUrl } from "~/models/assets";
import { getUserStudentStates, updateStudentStates } from "~/models/student-state";

export const meta: MetaFunction = () => [
  { title: "학생 명부 | 몰루로그" },
];

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const env = context.env as Env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  return json({
    states: (await getUserStudentStates(env, sensei.username))!,
  });
};

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const env = context.env as Env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei) {
    return redirect("/signin");
  }

  const formData = await request.formData();
  const states = JSON.parse(formData.get("states") as string);
  await updateStudentStates(env, sensei, states);
  return json({});
};

export default function EditStudents() {
  const loaderData = useLoaderData<typeof loader>();

  const fetcher = useFetcher();
  const [hasChanges, setHasChanges] = useState(false);
  const [Toast, showToast] = useToast({
    children: (
      <p>
        성공적으로 저장했어요.&nbsp;
        <Link to="/my?path=students">
          <span className="text-blue-400 hover:opacity-75 underline transition">
            학생 목록 보러가기 →
          </span>
        </Link>
      </p>
    ),
  });

  useEffect(() => {
    if (fetcher.state === "loading") {
      showToast();
      setHasChanges(false);
    }
  }, [fetcher]);


  const [states, setStates] = useState(loaderData.states);
  const [StateFilter, filteredStates, updateStatesToFilter] = useStateFilter(states, false, true, true);

  const updateState = (studentId: string, newState: Partial<typeof states[0]>) => {
    setStates((prev) => {
      const index = prev.findIndex((state) => state.student.id === studentId);
      if (index === -1) {
        return prev;
      }

      const newStates = [...prev];
      newStates[index] = { ...newStates[index], ...newState };
      updateStatesToFilter(newStates);
      return newStates;
    });

    setHasChanges(true);
  };

  return (
    <>
      <Title text="학생 명부" />
      {StateFilter}

      <div className="mb-32 grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredStates.map(({ student, owned, tier }) => {
          return (
            <div
              key={student.id}
              className="p-4 bg-neutral-100 hover:bg-neutral-200 transition rounded-lg"
            >
              <div className="flex items-center gap-x-3">
                <img
                  className={`size-10 object-cover rounded-full ${owned ? "" : "grayscale opacity-75"}`}
                  src={studentImageUrl(student.id)}
                  alt={student.name}
                />
                <p className="grow">{student.name}</p>
                <Toggle
                  initialState={owned}
                  onChange={(toggle) => updateState(student.id, { owned: toggle })}
                />
              </div>
              {owned && (
                <div className="mt-4">
                  <EditTier
                    initialTier={student.initialTier}
                    currentTier={tier ?? student.initialTier}
                    onUpdate={(newTier) => updateState(student.id, { tier: newTier })}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasChanges && (
        <fetcher.Form method="post">
          <input type="hidden" name="states" value={JSON.stringify(states.filter(({ owned }) => owned))} />
          <FloatingButton state={fetcher.state} />
        </fetcher.Form>
      )}

      {Toast}
    </>
  );
}
