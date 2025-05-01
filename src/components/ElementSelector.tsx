import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SelectorInfo } from '@/services/cheerioService';

interface ElementSelectorProps {
  html: string;
  onSelect: (selector: string) => void;
  selectorInfo: SelectorInfo | null;
  isGenerating: boolean;
  selector: string;
  onSelectorChange: (value: string) => void;
}

const ElementSelector: React.FC<ElementSelectorProps> = ({
  html,
  onSelect,
  selectorInfo,
  isGenerating,
  selector,
  onSelectorChange,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selector.trim()) {
      toast.error('Please enter a valid CSS selector');
      return;
    }
    onSelect(selector);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Element Selector</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="selector">CSS Selector</Label>
            <div className="flex gap-2">
              <Input
                id="selector"
                placeholder="Enter a CSS selector (e.g., #main-content, .header, div.container)"
                value={selector}
                onChange={(e) => onSelectorChange(e.target.value)}
                disabled={!html || isGenerating}
              />
              <Button
                type="submit"
                disabled={!html || isGenerating || !selector.trim()}
              >
                {isGenerating ? (
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                ) : (
                  'Generate'
                )}
              </Button>
            </div>
          </div>
        </form>

        {!selectorInfo && !isGenerating && html && (
          <Alert className="mt-4">
            <AlertDescription>
              Enter a CSS selector to generate a context-aware selector string.
              Examples:{' '}
              <code className="bg-muted px-1 rounded">.class-name</code>,
              <code className="bg-muted px-1 rounded">#id-name</code>,
              <code className="bg-muted px-1 rounded">div.container</code>
            </AlertDescription>
          </Alert>
        )}

        {selectorInfo && (
          <div className="mt-4 space-y-4">
            <div>
              <Label className="block mb-1">Generated Selector Path</Label>
              <div className="flex items-center gap-2">
                <code className="bg-muted p-2 text-xs rounded block w-full whitespace-pre-wrap break-all">
                  {selectorInfo.path}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(selectorInfo.path)}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div>
              <Label className="block mb-1">Element</Label>
              <Badge variant="outline" className="font-mono">
                {selectorInfo.element}
              </Badge>
            </div>

            <div>
              <Label className="block mb-1">JavaScript One-liner</Label>
              <div className="flex items-center gap-2">
                <code className="bg-muted p-2 text-xs rounded block w-full whitespace-pre-wrap break-all">
                  {`document.querySelector("${selectorInfo.path.replace(/"/g, '\\"')}")`}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    copyToClipboard(
                      `document.querySelector("${selectorInfo.path.replace(/"/g, '\\"')}")`
                    )
                  }
                >
                  Copy
                </Button>
              </div>
            </div>

            {Object.keys(selectorInfo.attributes).length > 0 && (
              <div>
                <Label className="block mb-1">Element Attributes</Label>
                <Textarea
                  readOnly
                  value={JSON.stringify(selectorInfo.attributes, null, 2)}
                  className="font-mono h-24 text-xs"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ElementSelector;
