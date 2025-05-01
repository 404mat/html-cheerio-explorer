import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Code, FileCode, FileJson } from 'lucide-react';

interface HtmlViewerProps {
  html: string;
  isLoading: boolean;
  filters: string[];
  onFiltersChange: (value: string[]) => void;
}

const HtmlViewer: React.FC<HtmlViewerProps> = ({
  html,
  isLoading,
  filters,
  onFiltersChange,
}) => {
  const [displayedHtml, setDisplayedHtml] = useState<string>(html);

  useEffect(() => {
    let processedHtml = html;

    if (filters.includes('head')) {
      processedHtml = processedHtml.replace(
        /<head\b[^>]*>[\s\S]*?<\/head>/gi,
        '<!-- <head> content hidden -->'
      );
    }

    if (filters.includes('scripts')) {
      processedHtml = processedHtml.replace(
        /<script\b[^>]*>[\s\S]*?<\/script>/gi,
        '<!-- <script> content hidden -->'
      );
    }

    if (filters.includes('styles')) {
      processedHtml = processedHtml.replace(
        /<style\b[^>]*>[\s\S]*?<\/style>/gi,
        '<!-- <style> content hidden -->'
      );
      // Also filter out inline styles in style attributes
      processedHtml = processedHtml.replace(/style="[^"]*"/gi, 'style="..."');
    }

    setDisplayedHtml(processedHtml);
  }, [html, filters]);

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {!isLoading && html && (
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm font-medium">Filter HTML:</div>
            <ToggleGroup
              type="multiple"
              value={filters}
              onValueChange={onFiltersChange}
              className="justify-end"
            >
              <ToggleGroupItem value="head" aria-label="Hide head content">
                <FileJson className="mr-1" size={16} />
                <span>Hide &lt;head&gt;</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="scripts" aria-label="Hide scripts">
                <FileCode className="mr-1" size={16} />
                <span>Hide &lt;script&gt;</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="styles" aria-label="Hide styles">
                <Code className="mr-1" size={16} />
                <span>Hide &lt;style&gt;</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        )}
        <ScrollArea className="h-[400px] w-full border rounded-md">
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-[360px]">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (
              <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                {displayedHtml || 'Enter a URL above to fetch HTML content.'}
              </pre>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default HtmlViewer;
