const MyMessage = ({ message }) => {
  return (
    <div className="mt-1 flex flex-col items-end">
      <div className="my-1 ml-[25%] inline-block max-w-[60%] text-pretty break-words rounded-[20px] bg-gradient-to-b from-[#00D0EA] from-0% to-[#0085D1] to-100% bg-fixed px-4 py-2 text-white">
        {message}
      </div>
    </div>
  );
};

export default MyMessage;
