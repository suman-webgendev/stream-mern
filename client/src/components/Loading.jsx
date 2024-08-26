import "@/styles/loader.css";

const Loading = () => {
  return (
    <div className="card z-[10000] flex h-screen items-center justify-center">
      <div className="loader">
        <p>loading</p>
        <div className="words">
          <span className="word">buttons</span>
          <span className="word">links</span>
          <span className="word">cards</span>
          <span className="word">images</span>
          <span className="word">videos</span>
          <span className="word">buttons</span>
        </div>
      </div>
    </div>
  );
};

export default Loading;
