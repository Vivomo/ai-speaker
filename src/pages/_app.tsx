import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import {
    MantineProvider,
    ColorSchemeProvider,
    ColorScheme,
    MantineThemeOverride
} from '@mantine/core'
import { useState } from 'react';
import { Notifications }  from '@mantine/notifications';

export default function App({ Component, pageProps }: AppProps) {
    const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
    const toggleScheme = () => {
        setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
    }
    return (
        <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleScheme}>
            <MantineProvider
                theme={{
                    colorScheme,
                    primaryColor: 'green'
                } as MantineThemeOverride}
                withNormalizeCSS
                withGlobalStyles
            >
                <Notifications
                    position="top-right"
                    zIndex={2077}
                />
                <Component {...pageProps} />

            </MantineProvider>

        </ColorSchemeProvider>
    )

}
