import Loading from "@/components/Loading";
import { ScrollArea } from "@/components/ui/scroll-area";
import VideoList from "@/components/VideoList";
import { api } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

const Home = () => {
  const {
    data: videos,
    error,
    isFetching,
  } = useQuery({
    queryKey: ["VideoList"],
    queryFn: async () => {
      const res = await api.get("/api/video");
      if (res.status !== 200) {
        throw new Error("Failed to fetch videos!");
      }
      return res.data;
    },
  });
  if (isFetching && !error) {
    return <Loading />;
  }

  return (
    <motion.div
      initial={{
        y: 30,
        opacity: 20,
      }}
      animate={{
        y: 0,
        opacity: 100,
      }}
      transition={{ duration: 0.5 }}
    >
      <ScrollArea className="h-[94vh] rounded-md border pb-6">
        <VideoList videos={videos} />
      </ScrollArea>
    </motion.div>
  );
};

export default Home;
