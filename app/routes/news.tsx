import dayjs from "dayjs";
import { LoaderFunctionArgs, useLoaderData, type MetaFunction } from "react-router";
import { MarkdownText, Title } from "~/components/atoms/typography";
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
              <MarkdownText text={post.content} />
            </ActionCard>
          </div>
        ))}
      </div>
    </>
  );
}
