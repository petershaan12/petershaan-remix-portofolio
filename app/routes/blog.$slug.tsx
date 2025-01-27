import { posts } from ".velite";
import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";  
import { useLoaderData, Meta, Links, useRouteError } from "@remix-run/react";  
import { MDXContent } from "~/components/mdx-component";
import NotFound from "~/components/not-found";
import { Tag } from "~/components/tag";
import { connectDB, getDB } from "~/lib/db.server.";

export const meta: MetaFunction<typeof loader> = ({ data }) => {  
  if (!data || !data.post) {  
    return [  
      { title: "Not Found" },  
      { description: "The post you are looking for does not exist." },  
    ];  
  }  
  
  return [  
    { title: data.post.title },  
    { description: data.post.description || "No description available." },  
  ];  
};  

export const loader = async ({ params }: LoaderFunctionArgs) => {  
  await connectDB();
  const db = getDB();
  const slug = params.slug as string;
  const post = posts.find((post) => post.slugAsParams === slug);  

  if (!post || !post.published) {  
    throw new Response(null, {
      status: 404,
      statusText: "Not Found",
    });  
  }  

  const postViews = await db.collection("posts").findOne({ slug });  
  
  let views = 0;  
  if (postViews) {  
    views = postViews.viewCount;  
    await db.collection("posts").updateOne({ slug }, { $inc: { viewCount: 1 } });  
  } else {  
    await db.collection("posts").insertOne({ slug, viewCount: 1 });  
    views = 1;  
  }  
  
  return json<any>({post, views });  
};  
  
  
export default function PostPage() {  
  const { post, views } = useLoaderData<typeof loader>();  
  
  return (  
    <article className="container py-6 prose dark:prose-invert max-w-3xl mx-auto">  
      <Meta />  
      <Links />  
      <h1 className="mb-2 text-2xl font-semibold">{post.title}</h1>  
      <div className="flex gap-2 mb-2">  
        {post.tags?.map((tag: string) => (  
          <Tag tag={tag} key={tag} />  
        ))}  
      </div>  
      {post.description ? (  
        <p className="mt-0 prose prose-neutral dark:prose-invert ">  
          {post.description}  
        </p>  
      ) : null}  
      <div className="flex items-center space-x-4">  
        {views !== null ? `${views} views` : "Loading views..."}  
      </div>  
      <hr className="my-4" />  
      <MDXContent code={post.body} />  
    </article>  
  );  
}  

export function ErrorBoundary() {
  return <NotFound />;
}