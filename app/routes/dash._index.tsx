import { Link, useLoaderData } from "react-router";
import { Button } from "~/components/atoms/form";
import { SubTitle, Title } from "~/components/atoms/typography";
import { getAllPosts } from "~/models/post";
import type { LoaderFunctionArgs } from "react-router";
import { getAuthenticator } from "~/auth/authenticator.server";
import { redirect } from "react-router";

export async function loader({ request, context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  if (!sensei || sensei.role !== "admin") {
    return redirect("/unauthorized");
  }

  const posts = await getAllPosts(env);
  return { posts };
}

export default function DashboardIndex() {
  const { posts } = useLoaderData<{ posts: any[] }>();

  return (
    <>
      <Title text="관리자 화면" />

      <SubTitle text="게시물 관리" />
      <div className="mt-4 flex justify-between items-center">
        <Link to="/dash/posts/new">
          <Button text="새 글 쓰기" color="primary" />
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-neutral-200 dark:border-neutral-700">
              <th className="text-left py-3 px-4">제목</th>
              <th className="text-left py-3 px-4">게시판</th>
              <th className="text-left py-3 px-4">작성일</th>
              <th className="text-left py-3 px-4">관리</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr
                key={post.uid}
                className="border-b border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800"
              >
                <td className="py-3 px-4">{post.title}</td>
                <td className="py-3 px-4">{post.board}</td>
                <td className="py-3 px-4">
                  {new Date(post.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <Link
                    to={`/dash/posts/${post.uid}`}
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    수정
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
