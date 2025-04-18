import { StudentCard } from "~/components/atoms/student";

type StudentEventInfoProps = {
  studentId: string | null;
  children?: React.ReactNode | React.ReactNode[];
};



export default function StudentEventInfo({ studentId, children }: StudentEventInfoProps) {
  return (
    <div className="my-4 p-2 flex flex-col md:flex-row bg-neutral-100 dark:bg-neutral-900 rounded-lg">
      <div className="flex items-center grow">
        <div className="w-16 mx-2">
          <StudentCard studentId={studentId} />
        </div>
        <div className="px-2 md:px-4 grow">
          {children}
        </div>
      </div>
    </div>
  );
}
