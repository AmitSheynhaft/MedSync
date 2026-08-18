declare module 'pdfmake' {
  interface FontFiles {
    normal?: string;
    bold?: string;
    italics?: string;
    bolditalics?: string;
  }

  interface Fonts {
    [fontName: string]: FontFiles;
  }

  interface PdfPrinter {
    createPdfKitDocument(docDefinition: Record<string, unknown>, options?: Record<string, unknown>): PDFKit.PDFDocument;
    createPdf(docDefinition: Record<string, unknown>): {
      getBuffer(): Promise<Buffer>;
      download(filename?: string): void;
      open(): void;
    };
  }

  interface PdfPrinterConstructor {
    new (fonts: Fonts): PdfPrinter;
    setLocalAccessPolicy(fn: (path: string) => boolean): void;
    setUrlAccessPolicy(fn: (url: string) => boolean): void;
    setFonts(fonts: Fonts): void;
    createPdf(docDefinition: Record<string, unknown>): {
      getBuffer(): Promise<Buffer>;
    };
  }

  const pdfmake: PdfPrinterConstructor;
  export = pdfmake;
}
