import {useEffect, useState} from "react";
import API from "../services/api";
import PostCard from "../components/PostCard";

export default function Home() {
    const [posts, setPosts] = useState([]);

    const fetchPosts = async () => {
        const {data} = await API.get("/posts");
        setPosts(data);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="p-6 max-w-3xl mx-auto">
            {posts.map((p) => (
                <PostCard key={p.id} post={p} fetchPosts={fetchPosts} />
            ))}
        </div>
    );
}
