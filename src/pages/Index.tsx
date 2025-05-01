import React, { useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  fetchHtml,
  generateSelector,
  SelectorInfo,
} from '@/services/cheerioService';
import HtmlViewer from '@/components/HtmlViewer';
import ElementSelector from '@/components/ElementSelector';

const Index = () => {
  const [url, setUrl] = useState('');
  const [html, setHtml] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectorInfo, setSelectorInfo] = useState<SelectorInfo | null>(null);
  const [activeTab, setActiveTab] = useState('html');
  const [htmlViewerFilters, setHtmlViewerFilters] = useState<string[]>([]);
  const [elementSelectorInput, setElementSelectorInput] = useState('');

  const handleFetchHtml = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setSelectorInfo(null);

    try {
      const fetchedHtml = await fetchHtml(url);
      setHtml(fetchedHtml);
      toast.success('HTML fetched successfully');
      setActiveTab('html');
    } catch (error) {
      console.error('Error:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to fetch HTML'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateSelector = useCallback(
    (selector: string) => {
      setIsGenerating(true);

      try {
        const result = generateSelector(html, selector);
        if (result) {
          setSelectorInfo(result);
          setActiveTab('selector');
          toast.success('Selector generated successfully');
        } else {
          toast.error('No elements found matching this selector');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to generate selector');
      } finally {
        setIsGenerating(false);
      }
    },
    [html]
  );

  const handleElementSelectorInputChange = useCallback((value: string) => {
    setElementSelectorInput(value);
  }, []);

  const handleHtmlViewerFilterChange = useCallback((value: string[]) => {
    setHtmlViewerFilters(value);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
        HTML Context Explorer
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>URL Input</CardTitle>
          <CardDescription>
            Enter a website URL to fetch its HTML content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFetchHtml} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  placeholder="e.g., example.com, https://developer.mozilla.org"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !url.trim()}>
                  {isLoading ? (
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  ) : (
                    'Fetch HTML'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {html && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="html">HTML View</TabsTrigger>
            <TabsTrigger value="selector">Element Selector</TabsTrigger>
          </TabsList>
          <TabsContent value="html" className="mt-4">
            <HtmlViewer
              html={html}
              isLoading={isLoading}
              filters={htmlViewerFilters}
              onFiltersChange={handleHtmlViewerFilterChange}
            />
          </TabsContent>
          <TabsContent value="selector" className="mt-4">
            <ElementSelector
              html={html}
              onSelect={handleGenerateSelector}
              selectorInfo={selectorInfo}
              isGenerating={isGenerating}
              selector={elementSelectorInput}
              onSelectorChange={handleElementSelectorInputChange}
            />
          </TabsContent>
        </Tabs>
      )}

      {!html && !isLoading && (
        <Alert>
          <AlertDescription>
            Enter a URL above and click "Fetch HTML" to get started. Once HTML
            is loaded, you'll be able to use the Element Selector tool to
            generate context-aware CSS selectors.
          </AlertDescription>
        </Alert>
      )}

      <footer className="text-center text-xs text-muted-foreground mt-8">
        <p>
          Made with ❤️ (and frustration){' '}
          <span className="underline">
            <a href="https://github.com/404mat">by Mathias</a>
          </span>
        </p>
      </footer>
    </div>
  );
};

export default Index;
