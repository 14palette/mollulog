import { type ReactNode, useState } from "react";
import hangul from 'hangul-js';
import { SubTitle } from "~/components/atoms/typography";

const { search } = hangul;

type ContentProps = {
  uid: string;
  name: string;
  description: string | ReactNode;
  imageUrl: string | null;
  searchKeyword?: string;
};

type ContentSelectorProps = {
  contents: ContentProps[];
  initialContentUid?: string;
  placeholder?: string;
  searchable?: boolean;
  onSelectContent: (contentUid: string) => void;
};

function Content({ name, description, imageUrl }: ContentProps) {
  return (
    <div className="h-full w-full flex">
      <div className="py-2 pl-4 pr-8 h-full grow flex flex-col justify-center rounded-lg">
        <p className="font-bold line-clamp-1">{name}</p>
        <p className="text-xs md:text-sm text-neutral-500">{description}</p>
      </div>
      {imageUrl ? (
        <img
          src={imageUrl} alt={name}
          className="h-full max-w-32 md:max-w-48 aspect-video rounded-r-lg object-cover bg-linear-to-r from-white to-neutral-300 "
        />
      ) : null}
    </div>
  )
}

export default function ContentSelector({ contents, initialContentUid, placeholder, searchable, onSelectContent }: ContentSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedContent, setSelected] = useState<ContentSelectorProps["contents"][number] | null>(
    initialContentUid ? contents.find((content) => content.uid === initialContentUid) ?? null : null,
  );

  const [filteredContents, setFilteredContents] = useState(contents);

  return (
    <>
      <SubTitle text="컨텐츠" />

      <div className="relative">
        <div
          className={`my-4 h-24 w-full md:w-fit border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg hover:opacity-50 cursor-pointer transition-opacity ${open ? "opacity-50" : ""}`}
          onClick={() => setOpen((prev) => !prev)}
        >
          {selectedContent ? <Content {...selectedContent} /> : (
            <div>
              <div className="pl-4 pr-24 h-24 flex flex-col justify-center">
                <p className="text-lg font-bold">컨텐츠 선택</p>
                <p className="text-sm text-neutral-500">{placeholder ?? "컨텐츠를 선택하세요"}</p>
              </div>
            </div>
          )}
        </div>

        {open && (
          <div className="absolute left-0 w-full max-w-4xl pb-4 md:pb-64 z-10">
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg bg-white dark:bg-neutral-800">
              {searchable && (
                <div className="p-4">
                  <input
                    className="w-full dark:bg-neutral-800" type="text" placeholder="제목 혹은 학생으로 찾기..."
                    onChange={(e) => {
                      const keyword = e.target.value;
                      setFilteredContents(contents.filter((content) => search(content.searchKeyword ?? content.name, keyword) >= 0));
                    }}
                  />
                </div>
              )}
              {filteredContents.map((content) => (
                <div
                  key={content.uid}
                  className="h-24 border-t border-neutral-100 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer transition"
                  onClick={() => {
                    onSelectContent(content.uid);
                    setSelected(content);
                    setOpen(false);
                  }}
                >
                  <Content {...content} />
                </div>
              ))}
              {filteredContents.length === 0 && (
                <p className="border-t border-neutral-100 p-4 text-center text-neutral-500">검색 결과가 없어요.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
