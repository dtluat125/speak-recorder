import { Id } from '@/convex/_generated/dataModel';
import RecordingPage from './recording';

const Page = async ({ params: { id } }: { params: { id: Id<'notes'> } }) => {
  // const token = await getAuthToken();
  // const preloadedNote = await preloadQuery(
  //   api.notes.getNote,
  //   { id },
  //   { token },
  // );

  return <RecordingPage />;
};

export default Page;
