"use client";

export function Footer() {
  return (
    <footer className="py-12 border-t bg-muted/10">
      <div className="container mx-auto px-6 text-center text-muted-foreground">
        <p>
          &copy; {new Date().getFullYear()} LinkedInGen. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
