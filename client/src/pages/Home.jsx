import VideoList from "@/components/VideoList";
import { api } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const Home = () => {
  const {
    data: videos,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["VideoList"],
    queryFn: async () => {
      const res = await api.get("/video");
      console.log(res);
      if (res.status !== 200) {
        throw new Error("Failed to fetch videos!");
      }
      return res.data;
    },
  });

  console.log("video-list error", error);

  return (
    <div className="flex h-full flex-col items-center justify-center p-24">
      {isFetching && <div>Loading videos</div>}
      {videos && <VideoList videos={videos} />}
    </div>
  );
};

export default Home;
