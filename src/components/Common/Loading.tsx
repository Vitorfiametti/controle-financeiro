export default function Loading() {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-white bg-opacity-90 flex justify-center items-center z-50">
      <div className="spinner border-4 border-gray-300 border-t-blue-500 rounded-full w-12 h-12 animate-spin"></div>
    </div>
  );
}