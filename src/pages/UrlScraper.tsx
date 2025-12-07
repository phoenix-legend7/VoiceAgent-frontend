import { useState } from "react";
import { FaLink, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import axiosInstance, { handleAxiosError } from "../core/axiosInstance";
import Content from "../Layout/Content";
import { InputBox } from "../library/FormField";
import Card from "../library/Card";
import Modal from "../library/ModalProvider";

const UrlScraper = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [description, setDescription] = useState("");
  const [scrapedText, setScrapedText] = useState("");
  const [showModal, setShowModal] = useState(false);

  const extractTextFromHTML = (html: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const scripts = doc.querySelectorAll("script, style, noscript");
    scripts.forEach((el) => el.remove());

    const body = doc.body || doc.documentElement;
    let text = body.textContent || body.innerText || "";

    text = text
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/\n\s*\n/g, "\n") // Replace multiple newlines with single newline
      .trim();

    return text;
  };

  const scrapeUrl = async (urlToScrape: string): Promise<string> => {
    try {
      try {
        const response = await axiosInstance.post("/knowledge/scrape_url", {
          url: urlToScrape,
        });
        if (response.data && response.data.text) {
          return response.data.text;
        }
      } catch (backendError) {
        console.log("Backend scraping not available, trying client-side");
        toast.warning("Backend scraping not available, trying client-side");
      }

      const response = await fetch(urlToScrape, {
        method: "GET",
        headers: {
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      return extractTextFromHTML(html);
    } catch (error: any) {
      if (error.message?.includes("CORS") || error.message?.includes("Failed to fetch")) {
        throw new Error(
          "Cannot fetch this URL due to CORS restrictions."
        );
      }
      throw error;
    }
  };

  const createKnowledgeFromText = async (
    text: string,
    url: string,
    description: string
  ) => {
    // Create a text file from the scraped content
    const filename = new URL(url).hostname.replace(/\./g, "_") + "_scraped.txt";
    const file = new File([text], filename, { type: "text/plain" });

    // Generate presigned URL
    const generatePresignedUrl = async (filename: string) => {
      const payload = { filename };
      const response = await axiosInstance.post(
        "knowledge/generate_presigned_url",
        payload
      );
      const data = response.data;
      if (!data.url) {
        throw new Error(data);
      }
      return data;
    };

    // Upload file to AWS
    const uploadFileToAWS = async (
      key: string,
      awsAccessKeyId: string,
      awsSecurityToken: string,
      policy: string,
      signature: string,
      file: File
    ) => {
      const form = new FormData();
      form.append("key", key);
      form.append("AWSAccessKeyId", awsAccessKeyId);
      form.append("x-amz-security-token", awsSecurityToken);
      form.append("policy", policy);
      form.append("signature", signature);
      form.append("file", file);
      return axios.post(
        "https://millis-ai-agent-knowledge.s3.amazonaws.com/",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
    };

    const presignedUrl = await generatePresignedUrl(filename);
    await uploadFileToAWS(
      presignedUrl.fields["key"],
      presignedUrl.fields["AWSAccessKeyId"],
      presignedUrl.fields["x-amz-security-token"],
      presignedUrl.fields["policy"],
      presignedUrl.fields["signature"],
      file
    );

    // Create knowledge file
    const data = {
      object_key: presignedUrl.fields.key,
      description: description || `Content scraped from ${url}`,
      name: filename,
      file_type: "text/plain",
      size: file.size,
    };
    await axiosInstance.post("/knowledge/create_file", data);
  };

  const handleScrape = async () => {
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    setIsLoading(true);
    try {
      // Scrape the URL
      const text = await scrapeUrl(url);

      if (!text || text.trim().length === 0) {
        toast.error("No text content found on this page");
        setIsLoading(false);
        return;
      }

      // Show modal with scraped content
      setScrapedText(text);
      setShowModal(true);
    } catch (error) {
      handleAxiosError("Failed to scrape URL", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportToKnowledge = async () => {
    if (!scrapedText.trim()) {
      toast.error("No content to import. Please ensure the textarea has content.");
      return;
    }

    if (!url.trim()) {
      toast.error("URL is required for importing");
      return;
    }

    setIsImporting(true);
    try {
      // Create knowledge file
      await createKnowledgeFromText(
        scrapedText,
        url,
        description || `Content scraped from ${url}`
      );

      toast.success("URL content imported to Knowledge successfully!");
      setUrl("");
      setDescription("");
      setScrapedText("");
      setShowModal(false);
    } catch (error) {
      handleAxiosError("Failed to import to Knowledge", error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setScrapedText("");
  };

  return (
    <Content isOverlayShown={isLoading || isImporting}>
      <div className="flex flex-col gap-8 h-full">
        <div className="flex flex-col gap-1 justify-center">
          <h2 className="text-2xl font-bold">URL Scraper</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Paste a website URL to fetch and import its text content into Knowledge
          </p>
        </div>

        <Card title="Scrape URL" icon={<FaLink />}>
          <div className="flex flex-col gap-4 px-6 py-4">
            <div>
              <InputBox
                label="Website URL"
                placeholder="https://businesssite.com/pricing"
                value={url}
                onChange={(e) => setUrl(e)}
                inputClassName="bg-transparent"
                disabled={isLoading}
              />
            </div>

            <div>
              <InputBox
                label="Description (Optional)"
                placeholder="Describe what this content is about"
                value={description}
                onChange={(e) => setDescription(e)}
                inputClassName="bg-transparent"
                disabled={isLoading}
              />
            </div>

            <div>
              <button
                className="flex items-center gap-2 cursor-pointer bg-sky-600 text-white px-5 py-2 rounded-md transition-all duration-300 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleScrape}
                disabled={isLoading || !url.trim()}
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    <span>Fetching...</span>
                  </>
                ) : (
                  <span>Fetch Content</span>
                )}
              </button>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                <FaSpinner className="animate-spin" />
                <span>Fetching content from URL...</span>
              </div>
            )}
          </div>
        </Card>

        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            How it works
          </h3>
          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
            <li>Paste a website URL in the input box above</li>
            <li>Click "Fetch Content" to scrape the text from the page</li>
            <li>Review and edit the scraped content in the modal</li>
            <li>Click "Add to Knowledge" to import it to your Knowledge base</li>
            <li>
              Note: Some websites may block direct access due to CORS restrictions.
              For production use, implement a backend endpoint at{" "}
              <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                /knowledge/scrape_url
              </code>
            </li>
          </ul>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Review Scraped Content"
        okBtnLabel="Add to Knowledge"
        cancelBtnLabel="Cancel"
        onOK={handleImportToKnowledge}
        isLoading={isImporting}
        modalSize="max-w-4xl"
        hideOKButton={false}
        hideCloseButton={false}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Review and edit the scraped content:
            </label>
            <textarea
              className="w-full h-96 resize-none border border-gray-300 dark:border-gray-700 rounded-md p-3 focus:outline-none focus:border-sky-500 transition-all duration-300 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm"
              value={scrapedText}
              onChange={(e) => setScrapedText(e.target.value)}
              placeholder="Scraped content will appear here..."
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {scrapedText.length} characters
            </div>
          </div>
        </div>
      </Modal>
    </Content>
  );
};

export default UrlScraper;

