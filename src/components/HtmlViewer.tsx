import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HtmlViewerProps {
  html: string;
  isLoading: boolean;
}

const HtmlViewer: React.FC<HtmlViewerProps> = ({ html, isLoading }) => {
  return (
    <Card className="w-full">
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] w-full">
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-[360px]">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                {html || 'Enter a URL above to fetch HTML content.'}
              </pre>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default HtmlViewer;
