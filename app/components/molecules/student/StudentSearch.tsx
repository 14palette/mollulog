import { useState } from "react";
import { Input } from "~/components/atoms/form";
import StudentCards from "./StudentCards";
import { filterStudentByName } from "~/filters/student";

type SearchableStudent = {
  studentId: string;
  name: string;
};

type StudentSearchProps = {
  label?: string;
  placeholder?: string;
  description?: string;
  grid?: 4;

  students: SearchableStudent[];
  onSelect: (studentId: string) => void;
};

export default function StudentSearch(
  { label, placeholder, description, grid, students, onSelect }: StudentSearchProps,
) {
  const [searched, setSearched] = useState<SearchableStudent[]>([]);
  const [searchValue, setSearchValue] = useState("");

  const onSearch = (search: string) => {
    setSearchValue(search);
    if (search.length === 0) {
      return setSearched([]);
    }
    setSearched(filterStudentByName(search, students, grid ?? 6));
  };

  return (
    <>
      <div>
        <Input label={label} placeholder={placeholder ?? "이름으로 찾기..."} description={description} onChange={onSearch} value={searchValue} />
      </div>
      {(searched && searched.length > 0) && (
        <StudentCards
          pcGrid={grid}
          students={searched}
          onSelect={(studentId) => {
            if (studentId) {
              onSelect(studentId);
              setSearchValue("");
              setSearched([]);
            }
          }}
        />
      )}
    </>
  );
}
