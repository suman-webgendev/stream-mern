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
      if (res.status !== 200) {
        throw new Error("Failed to fetch videos!");
      }
      return res.data;
    },
  });

  return (
    <div>
      {isFetching && <div>Loading videos</div>}
      {!isFetching && !error && videos && <VideoList videos={videos} />}
    </div>
  );
};

export default Home;
