import { ContentSidebar } from './components/ContentSidebar';
import { ContentNav } from './components/ContentNav';

export default function ContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-56px)]">
      <ContentSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ContentNav />
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
