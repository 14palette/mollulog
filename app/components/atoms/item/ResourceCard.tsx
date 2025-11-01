import { ResourceTypeEnum } from "~/graphql/graphql";

type ResourceCardProps = {
  resourceType?: ResourceTypeEnum;
  rarity?: number;
  favoriteLevel?: number;
  label?: number | string;
  labelColor?: "white" | "yellow";
} & (
  {
    itemUid: string;
    imageUrl?: undefined;
  } | {
    itemUid?: undefined;
    imageUrl: string;
  }
);

export default function ResourceCard({ resourceType, rarity = 1, favoriteLevel, itemUid, imageUrl: imageUrlProp, label, labelColor = "white" }: ResourceCardProps) {
  const labelColorClass = labelColor === "white" ? "text-white" : "text-orange-300";

  let imageUrl = imageUrlProp;
  if (itemUid) {
    if (resourceType === "furniture") {
      imageUrl = furnitureImageUrl(itemUid);
    } else if (resourceType === "equipment") {
      imageUrl = equipmentImageUrl(itemUid);
    } else {
      imageUrl = itemImageUrl(itemUid);
    }
  }

  return (
    <div className="relative">
      <div className={`shrink-0 size-10 md:size-12 rounded-lg border border-neutral-200 dark:border-neutral-700 ${rarityBgClass(rarity)} flex items-center justify-center overflow-hidden`}>
        <img
          alt="아이템 이미지"
          src={imageUrl}
          className={`${imageUrl ? "size-6 md:size-8" : "w-full h-full"} object-contain`}
          loading="lazy"
        />
        {label && (
          <div className="px-1.5 absolute right-0 bottom-0 bg-neutral-900/80 backdrop-blur-sm text-white text-xs rounded-full">
            <span className={`${labelColorClass} text-xs font-medium`}>{label}</span>
          </div>
        )}
      </div>
      {favoriteLevel && <img src={favoriteLevelImageUrl(favoriteLevel)} alt={`호감 레벨 ${favoriteLevel}`} className="absolute -bottom-1 -right-1 w-6 h-6 object-contain" loading="lazy" />}
    </div>
  );
}

function rarityBgClass(rarity: number | null | undefined): string {
  switch (rarity) {
    case 4:
      return "bg-purple-200 dark:bg-purple-300";
    case 3:
      return "bg-orange-200 dark:bg-orange-300";
    case 2:
      return "bg-blue-200 dark:bg-blue-300";
    case 1:
    default:
      return "bg-neutral-100 dark:bg-neutral-500";
  }
}

function itemImageUrl(itemUid: string): string {
  return `https://baql-assets.mollulog.net/images/items/${itemUid}`;
}

function furnitureImageUrl(furnitureUid: string): string {
  return `https://baql-assets.mollulog.net/images/furnitures/${furnitureUid}`;
}

function equipmentImageUrl(equipmentUid: string): string {
  return `https://baql-assets.mollulog.net/images/equipments/${equipmentUid}`;
}

function favoriteLevelImageUrl(favoriteLevel: number): string {
  return `https://assets.mollulog.net/assets/images/ui/gift-reaction-${favoriteLevel}.png`;
}
