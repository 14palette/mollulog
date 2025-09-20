import type { MetaFunction, LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { isRouteErrorResponse, useLoaderData, useRouteError, useActionData, useNavigation, Form, redirect, Link } from "react-router";
import { useState } from "react";
import { graphql } from "~/graphql";
import { runQuery } from "~/lib/baql";
import { SubTitle, Title } from "~/components/atoms/typography";
import { ErrorPage } from "~/components/organisms/error";
import { StudentInfo } from "~/components/molecules/student";
import Button from "~/components/atoms/form/Button";
import Textarea from "~/components/atoms/form/Textarea";
import { STUDENT_GRADING_TAG_DISPLAY, type StudentGradingTagValue } from "~/models/student-grading-tag";
import TagIcon from "~/components/atoms/student/TagIcon";
import { getStudentGrading, upsertStudentGrading } from "~/models/student-grading";
import { getAuthenticator } from "~/auth/authenticator.server";

const studentDetailQuery = graphql(`
  query StudentGradeDetail($uid: String!) {
    student(uid: $uid) {
      name uid attackType defenseType role school schaleDbId
    }
  }
`);

export const loader = async ({ params, request, context }: LoaderFunctionArgs) => {
  const { env } = context.cloudflare;
  const studentUid = params.id!;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  if (!currentUser) {
    return redirect(`/students/${studentUid}`);
  }

  const { data, error } = await runQuery(studentDetailQuery as any, { uid: studentUid });
  let errorMessage: string | null = null;
  if (error || !data) {
    console.error(error);
    errorMessage = "학생 정보를 가져오는 중 오류가 발생했어요";
  } else if (!data.student) {
    errorMessage = "학생 정보를 찾을 수 없어요";
  }

  if (errorMessage) {
    throw new Response(JSON.stringify({ error: { message: errorMessage } }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get existing grading if any
  const existingGrading = await getStudentGrading(env, currentUser.id, studentUid, true);
  return { 
    student: data!.student!,
    existingGrading: existingGrading || null
  };
};

export const action = async ({ params, request, context }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const comment = formData.get("comment") as string;
  if (comment.length > 100) {
    return { error: "평가 내용은 최대 100자까지 작성할 수 있어요" };
  }

  const { env } = context.cloudflare;
  const studentUid = params.id!;
  const currentUser = await getAuthenticator(env).isAuthenticated(request);
  if (!currentUser) {
    return redirect(`/students/${studentUid}`);
  }

  const selectedTags = formData.getAll("tags") as StudentGradingTagValue[];
  try {
    await upsertStudentGrading(env, currentUser.id, studentUid, comment || null, selectedTags); 
    return redirect(`/students/${studentUid}`);
  } catch (error) {
    console.error("Error saving grading:", error);
    return { error: "평가를 저장하는 중 오류가 발생했어요" };
  }
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: `학생 평가 | 몰루로그` }];
  }

  const { student } = data;
  const title = `${student.name} - 학생 평가`;
  const description = `블루 아카이브 ${student.name}에 대한 평가를 작성해보세요.`;
  return [
    { title: `${title} | 몰루로그` },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
};

export const ErrorBoundary = () => {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    if (error.status === 401) {
      return <ErrorPage message="로그인이 필요해요" />;
    }
    return <ErrorPage message={error.data.error.message} />;
  } else {
    return <ErrorPage />;
  }
};

export default function StudentGrade() {
  const { student, existingGrading } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const [selectedTags, setSelectedTags] = useState<StudentGradingTagValue[]>(
    existingGrading?.tags || []
  );

  const toggleTag = (tag: StudentGradingTagValue) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <>
      <Title text="학생 평가" parentPath={`/students/${student.uid}`} />

      {/* Student Info */}
      <StudentInfo student={student} className="mb-6" />

      <Form method="post" className="space-y-6">
        <SubTitle text="학생 평가하기" description="최대 100자까지 작성할 수 있어요" />

        {/* Comment Section */}
        <Textarea
          name="comment"
          defaultValue={existingGrading?.comment || ""}
          placeholder="평가 내용을 작성해주세요 (선택)"
          rows={3}
        />

        {/* Tags Section */}
        <div className="-mt-4 flex flex-wrap gap-2">
          {Object.entries(STUDENT_GRADING_TAG_DISPLAY).map(([tagValue, displayName]) => {
            const isSelected = selectedTags.includes(tagValue as StudentGradingTagValue);
            const tag = tagValue as StudentGradingTagValue;
            return (
              <button
                key={tagValue}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`px-3 py-2 flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-700 transition-colors ${isSelected
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                    : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600"
                  }`}
              >
                <TagIcon tag={tag} />
                <span className="tracking-tighter shrink-0">{displayName}</span>
              </button>
            );
          })}
        </div>

        {/* Hidden inputs for selected tags */}
        {selectedTags.map(tag => (
          <input key={tag} type="hidden" name="tags" value={tag} />
        ))}

        {/* Submit Button */}
        <div className="flex">
          <Button type="submit" color="primary" text={isSubmitting ? "저장 중..." : existingGrading ? "편집 완료" : "작성 완료"}/>
          <Link to={`/students/${student.uid}`}>
            <Button type="button" text="취소" />
          </Link>
        </div>
        {actionData?.error && <p className="text-sm text-red-500 text-sm -mt-4">{actionData.error}</p>}
      </Form>
    </>
  );
}

