import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { defer } from "@remix-run/cloudflare";
import { Await, isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react";
import dayjs from "dayjs";
import { Suspense } from "react";
import { getAuthenticator } from "~/auth/authenticator.server";
import { SubTitle } from "~/components/atoms/typography";
import { StudentCards } from "~/components/molecules/student";
import { ContentHeader } from "~/components/organisms/content";
import { ErrorPage } from "~/components/organisms/error";
import { EventStages } from "~/components/organisms/event";
import { TimelinePlaceholder } from "~/components/organisms/useractivity";
import { graphql } from "~/graphql";
import type { EventStagesQuery, EventDetailQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import { eventTypeLocale, pickupLabelLocale } from "~/locales/ko";
import { getFavoritedCounts } from "~/models/content";
import type { StudentState} from "~/models/student-state";
import { getUserStudentStates } from "~/models/student-state";

const eventDetailQuery = graphql(`
  query EventDetail($eventId: String!) {
    event(eventId: $eventId) {
      name
      type
      since
      until
      imageUrl
      videos {
        title
        youtube
        start
      }
      pickups {
        type
        rerun
        student { studentId }
        studentName
      }
    }
  }
`);

const eventStagesQuery = graphql(`
  query EventStages($eventId: String!) {
    event(eventId: $eventId) {
      stages {
        difficulty
        index
        entryAp
        rewards {
          item {
            itemId
            name
            imageId
            eventBonuses {
              student { studentId role }
              ratio
            }
          }
          amount
        }
      }
    }
  }
`);

async function getEventStages(eventId: string): Promise<Exclude<EventStagesQuery["event"], null>["stages"] | []> {
  const { data, error } = await runQuery<EventStagesQuery>(eventStagesQuery, { eventId });
  if (error || !data?.event) {
    return [];
  }
  return data.event.stages;
}

export const loader = async ({ params, context, request }: LoaderFunctionArgs) => {
  const { data, error } = await runQuery<EventDetailQuery>(eventDetailQuery, { eventId: params.id });
  let errorMessage: string | null = null;
  if (error || !data) {
    errorMessage = error?.message ?? "이벤트 정보를 가져오는 중 오류가 발생했어요";
  } else if (!data.event) {
    errorMessage = "이벤트 정보를 찾을 수 없어요";
  }

  if (errorMessage) {
    throw new Response(
      JSON.stringify({ error: { message: errorMessage } }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  const pickupStudentIds = data!.event!.pickups.map((pickup) => pickup.student?.studentId).filter((id) => id !== undefined);

  const env = context.cloudflare.env;
  const sensei = await getAuthenticator(env).isAuthenticated(request);
  let studentStates: StudentState[] = [];
  if (sensei) {
    studentStates = await getUserStudentStates(env, sensei.username, true) ?? [];
    studentStates = studentStates.filter(({ student }) => pickupStudentIds.includes(student.id));
  }

  return defer({
    event: data!.event!,
    stages: getEventStages(params.id as string),
    studentStates,
    favoritedCounts: await getFavoritedCounts(env, pickupStudentIds),
    signedIn: sensei !== null,
  });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: "이벤트 정보 | 몰루로그" }];
  }

  const { event } = data;
  const title = `${event.name} - 이벤트 정보`;
  const description = `블루 아카이브 "${event.name}" 이벤트의 공략, 픽업 정보 모음`;
  return [
    { title: `${title} | 몰루로그` },
    { name: "description", content: description },
    { name: "og:title", content: title },
    { name: "og:image", content: event.imageUrl },
    { name: "og:description", content: description },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:card", content: "summary_large_image" },
  ];
};

export const ErrorBoundary = () => {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <ErrorPage message={error.data.error.message} />;
  } else {
    return <ErrorPage />;
  }
};

export default function EventDetail() {
  const { event, stages, signedIn, studentStates, favoritedCounts } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="my-8">
        <ContentHeader
          name={event.name}
          type={eventTypeLocale[event.type]}
          since={dayjs(event.since)}
          until={dayjs(event.until)}
          image={event.imageUrl}
          videos={event.videos}
        />
      </div>

      {event.pickups.length > 0 && (
        <div className="my-8">
          <SubTitle text="픽업 학생" />
          <StudentCards
            students={event.pickups.map((pickup) => {
              const studentId = pickup.student?.studentId ?? null;
              return {
                studentId,
                name: pickup.studentName,
                label: (<span className={pickup.rerun ? "text-white" : "text-yellow-500"}>{pickupLabelLocale(pickup)}</span>),
                state: {
                  favoritedCount: favoritedCounts.find((favorited) => favorited.studentId === studentId)?.count,
                },
              };
            })}
            mobileGrid={5}
          />
        </div>
      )}

      <Suspense fallback={<TimelinePlaceholder />}>
        <Await resolve={stages}>
          {(stages) => event.type === "event" && stages && stages.length > 0 && (
            <EventStages
              stages={stages}
              signedIn={signedIn}
              ownedStudentIds={studentStates.filter(({ owned }) => owned).map(({ student }) => student.id)}
            />
          )}
        </Await>
      </Suspense>
    </>
  );
}
