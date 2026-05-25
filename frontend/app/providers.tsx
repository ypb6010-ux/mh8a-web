"use client";

import { MantineProvider } from "@mantine/core";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider forceColorScheme= "dark" >
      {children}
    </MantineProvider>
  );
}
