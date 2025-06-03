import { useState } from "react";
import { Input, Button, Textarea } from "~/components/atoms/form";
import { StudentSearch } from "~/components/molecules/student";
import { studentImageUrl } from "~/models/assets";

type ProfileStudent = {
  uid: string;
  name: string;
};

type ProfileEditorProps = {
  students: ProfileStudent[];
  initialData?: {
    username: string;
    profileStudentId: string | null;
    friendCode: string | null;
    bio: string | null;
  };
  error?: {
    username?: string;
    friendCode?: string;
    bio?: string;
  };
}

export default function ProfileEditor({ students, initialData, error }: ProfileEditorProps) {
  const [profileStudent, setProfileStudent] = useState<ProfileStudent | null>(
    initialData?.profileStudentId ? students.find(({ uid }) => initialData.profileStudentId === uid) ?? null : null
  );

  return (
    <>
      <Input
        name="username" label="닉네임" defaultValue={initialData?.username}
        error={error?.username}
        description="4~20글자의 영숫자 및 _ 기호를 이용할 수 있어요."
      />

      <Textarea
        name="bio" label="자기소개" defaultValue={initialData?.bio ?? undefined}
        description="100글자까지 작성할 수 있어요."
        error={error?.bio}
      />

      <StudentSearch
        label="프로필 학생"
        placeholder="이름으로 찾기..."
        description="프로필 이미지로 학생을 설정할 수 있어요."
        students={students}
        onSelect={(uid) => setProfileStudent(students.find((student) => student.uid === uid)!)}
      />
      {profileStudent && (
        <>
          <div className="mt-4 mb-12 flex items-center px-4 py-2 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
            <img
              className="h-12 w-12 mr-4 rounded-full object-cover"
              src={studentImageUrl(profileStudent.uid)}
              alt={profileStudent.name}
            />
            <p><span className="font-bold">{profileStudent.name}</span> 학생을 선택했어요.</p>
          </div>
          <input type="hidden" name="profileStudentId" value={profileStudent.uid} />
        </>
      )}

      <Input
        name="friendCode" label="친구 코드 (선택)" defaultValue={initialData?.friendCode ?? undefined}
        error={error?.friendCode}
        description="게임 내 [소셜] > [친구] > [ID 카드] 에서 확인할 수 있어요."
      />

      <Button type="submit" text="완료" color="primary" className="mb-8 md:mb-16" />
    </>
  );
}
