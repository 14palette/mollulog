import { Form, redirect, useActionData, useNavigate, useLoaderData } from "react-router";
import { useEffect, useState } from "react";
import { Button, Input, Textarea } from "~/components/atoms/form";
import { MarkdownText, Title } from "~/components/atoms/typography";
import { createPost, getPostByUid, updatePost } from "~/models/post";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";

export async function loader({ params, request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei || sensei.role !== "admin") {
    return redirect("/unauthorized");
  }

  const uid = params.uid;
  if (!uid) {
    return redirect("/dash");
  }

  if (uid === "new") {
    return { post: null };
  }

  const post = await getPostByUid(env, uid);
  if (!post) {
    return redirect("/dash");
  }

  return { post };
}

export async function action({ request, context, params }: ActionFunctionArgs) {
  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei || sensei.role !== "admin") {
    return redirect("/unauthorized");
  }

  const formData = await request.formData();
  const title = formData.get("title") as string;
  const board = formData.get("board") as string;
  const content = formData.get("content") as string;

  if (!title || !content || !board) {
    return { error: "모든 필드를 입력해주세요." };
  }

  try {
    const uid = params.uid;
    if (!uid) {
      return { error: "잘못된 요청입니다." };
    }

    if (uid === "new") {
      await createPost(env, title, content, board);
    } else {
      await updatePost(env, uid, title, content, board);
    }
    return { success: true };
  } catch (error) {
    return { error: "게시물 저장에 실패했습니다." };
  }
}

export default function PostForm() {
  const { post } = useLoaderData<{ post?: any }>();
  const actionData = useActionData<{ error?: string; success?: boolean }>();
  const navigate = useNavigate();
  const [preview, setPreview] = useState(false);
  const [content, setContent] = useState(post?.content ?? "");

  useEffect(() => {
    if (actionData?.success) {
      navigate("/dash");
    }
  }, [actionData, navigate]);

  return (
    <>
      <Title text={post ? "글 수정하기" : "새 글 쓰기"} />

      <Form method="post" className="mt-8">
        <Input name="title" label="제목" required defaultValue={post?.title} />
        <Input name="board" label="게시판" required defaultValue={post?.board} />

        {preview ? (
          <div className="mt-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
            <MarkdownText text={content} />
          </div>
        ) : (
          <Textarea
            name="content"
            label="내용"
            rows={40}
            required
            error={actionData?.error ?? undefined}
            description="마크다운 문법을 지원합니다."
            onChange={(value) => setContent(value)}
            defaultValue={content}
          />
        )}

        <div className="mt-8 flex justify-end">
          <Button type="button" text={preview ? "편집하기" : "미리보기"} onClick={() => setPreview(!preview)} />
          <Button type="submit" text="완료" color="primary" />
        </div>
      </Form>
    </>
  );
} 