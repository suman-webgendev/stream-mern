import Loading from "@/components/Loading";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVideoList } from "@/hooks/video";
import { motion } from "framer-motion";
import { lazy, Suspense } from "react";

const Home = () => {
  const VideoList = lazy(() => import("@/components/VideoList"));
  const { data: videos, error, isFetching } = useVideoList();
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
      <ScrollArea className="h-[95vh] rounded-md border pb-6">
        <Suspense fallback={<Loading />}>
          <VideoList videos={videos} />
        </Suspense>
      </ScrollArea>
    </motion.div>
  );
};

export default Home;
