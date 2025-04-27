import { Link } from "react-router";

type FloatingButtonProps = {
  Icon: React.ReactNode;
  text: string;
  onClick?: () => void;
  to?: string;
};

export default function FloatingButton({ Icon, text, onClick, to }: FloatingButtonProps) {
  const button = (
    <div className="fixed bottom-12 right-4 px-4 py-2 rounded-full flex items-center bg-linear-to-br from-sky-500 to-indigo-500 text-white cursor-pointer shadow-lg" onClick={onClick}>
      {Icon}
      <p className="text-lg">{text}</p>
    </div>
  );

  if (to) {
    return <Link to={to}>{button}</Link>;
  }
  return button;
}