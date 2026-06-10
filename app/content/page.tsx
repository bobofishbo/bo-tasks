import { ContentCalendar } from './components/ContentCalendar';
import { ContentSidebar } from './components/ContentSidebar';

export default function ContentPage() {
  return (
    <div className="flex h-[calc(100vh-56px)]">
      <ContentSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ContentCalendar />
      </div>
    </div>
  );
}
