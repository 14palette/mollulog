import dayjs from "dayjs";
import { marked } from "marked";
import { LoaderFunctionArgs, useLoaderData, type MetaFunction } from "react-router";
import { Title } from "~/components/atoms/typography";
import { ActionCard } from "~/components/molecules/editor";
import { getAllPosts } from "~/models/post";

export const meta: MetaFunction = () => {
  return [
    { title: "업데이트 소식 | 몰루로그" },
  ];
};

export async function loader({ context }: LoaderFunctionArgs) {
  const posts = await getAllPosts(context.cloudflare.env, "news");
  return { posts };
}

export default function News() {
  const { posts } = useLoaderData<typeof loader>();
  return (
    <>
      <Title text="업데이트 소식" />
      <div className="mt-4">
        {posts.map((post) => (
          <div className="mb-12" key={post.uid}>
            <h3 className="text-lg font-bold">{post.title}</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{dayjs(post.createdAt).format("YYYY-MM-DD")}</p>
            <ActionCard actions={[]}>
              <div className="prose prose-neutral dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-li:my-1 prose-hr:my-4">
                <div dangerouslySetInnerHTML={{ __html: marked(post.content) }} />
              </div>
            </ActionCard>
          </div>
        ))}
      </div>
    </>
  );
}
