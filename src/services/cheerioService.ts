import * as cheerio from 'cheerio';

const CORS_PROXY_URL = 'https://api.allorigins.win/get?url=';

export interface SelectorInfo {
  path: string;
  element: string;
  attributes: Record<string, string>;
  htmlSnippet: string;
}

export const generateSelector = (
  html: string,
  selector: string
): SelectorInfo | null => {
  try {
    const $ = cheerio.load(html);
    const element = $(selector);

    if (element.length === 0) {
      return null;
    }

    // Get the target element and up to 4 parent elements
    const el = element.first();
    const path: string[] = [];
    let currentEl = el;

    // Process the target element
    const tagName = currentEl.prop('tagName')?.toLowerCase() || '';
    const id = currentEl.attr('id');
    const classes = currentEl.attr('class')?.split(/\s+/).filter(Boolean) || [];

    if (id) {
      path.push(`#${id}`);
    } else if (classes.length > 0) {
      path.push(`${tagName}.${classes.join('.')}`);
    } else {
      path.push(tagName);
    }

    // Process up to 4 parent elements
    let parentCount = 0;
    currentEl = currentEl.parent();

    while (currentEl.length && parentCount < 4) {
      const parentTag = currentEl.prop('tagName')?.toLowerCase();
      if (!parentTag || parentTag === 'html' || parentTag === 'body') {
        break;
      }

      const parentId = currentEl.attr('id');
      const parentClasses =
        currentEl.attr('class')?.split(/\s+/).filter(Boolean) || [];

      if (parentId) {
        path.unshift(`#${parentId}`);
        break; // ID is unique, so we can stop here
      } else if (parentClasses.length > 0) {
        path.unshift(`${parentTag}.${parentClasses.join('.')}`);
      } else {
        path.unshift(parentTag);
      }

      currentEl = currentEl.parent();
      parentCount++;
    }

    // Collect element attributes
    const attributes: Record<string, string> = {};
    const attribs = el.prop('attribs');
    if (attribs) {
      Object.keys(attribs).forEach((key) => {
        attributes[key] = attribs[key];
      });
    }

    // Get the outer HTML of the element
    const htmlSnippet = $.html(el) || '';

    return {
      path: path.join(' > '),
      element: tagName,
      attributes,
      htmlSnippet,
    };
  } catch (error) {
    console.error('Error generating selector:', error);
    return null;
  }
};

export const fetchHtml = async (url: string): Promise<string> => {
  try {
    // Add protocol if missing
    let processedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      processedUrl = 'https://' + url;
    }

    // Use the configurable CORS proxy
    const response = await fetch(
      `${CORS_PROXY_URL}${encodeURIComponent(processedUrl)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      // Assume it's a JSON response from the proxy
      const data = await response.json();
      if (data && typeof data.contents === 'string') {
        return data.contents;
      } else {
        // If the JSON doesn't have 'contents', it might be an error from the proxy or a different JSON structure
        console.error('Unexpected JSON response from proxy:', data);
        throw new Error('Unexpected response format from CORS proxy.');
      }
    } else {
      // This case might occur if the proxy itself returns non-JSON or an error page
      console.error(
        'Unexpected non-JSON response from proxy. Content-Type:',
        contentType
      );
      throw new Error('Unexpected response from CORS proxy.');
    }
  } catch (error) {
    console.error('Error fetching HTML:', error);
    throw new Error(
      `Failed to fetch HTML: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};
