import { CommentForm } from "@/components/CommentForm";
import { CommentList } from "@/components/CommentList";
import { Vote } from "@/components/Vote";
import { db } from "@/db";

export default async function SinglePostPage({ params }) {
  const postId = params.postId;

  const { rows: posts } = await db.query(
    `SELECT didit_posts.id, didit_posts.title, didit_posts.body, didit_posts.created_at, didit_users.name, 
    COALESCE(SUM(votes.vote), 0) AS vote_total
    FROM didit_posts
    JOIN didit_users ON didit_posts.user_id = didit_users.id
    LEFT JOIN didit_votes ON didit_votes.post_id = didit_posts.id
    WHERE didit_posts.id = $1
    GROUP BY didit_posts.id, didit_users.name
    LIMIT 1;`,
    [postId]
  );
  const post = posts[0];

  const { rows: votes } = await db.query(
    `SELECT *, didit_users.name from didit_votes
     JOIN didit_users on didit_votes.user_id = didit_users.id`
  );

  return (
    <div className="max-w-screen-lg mx-auto pt-4 pr-4">
      <div className="flex space-x-6">
        <Vote postId={post.id} votes={post.vote_total} />
        <div className="">
          <h1 className="text-2xl">{post.title}</h1>
          <p className="text-zinc-400 mb-4">Posted by {post.name}</p>
        </div>
      </div>
      <main className="whitespace-pre-wrap m-4">{post.body}</main>

      <CommentForm postId={post.id} />
      <CommentList postId={post.id} />
    </div>
  );
}
