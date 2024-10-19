import { type Metadata } from 'next';
import { ChakraProvider } from '@chakra-ui/react'


export const metadata: Metadata = {
  title: 'Pretty Colors',
  description: 'Google Meet Add-on that shows an animation',
};

import {
  Flex,
  Container,
  Heading,
  Stack,
  Text,
  Button,
  Image
} from '@chakra-ui/react'



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">

        <body className="flex-row">
      <ChakraProvider>
        <Container maxW={'5xl'}>
      <Stack
        textAlign={'center'}
        align={'center'}
        spacing={{ base: 8, md: 10 }}
        py={{ base: 20, md: 28 }}>
        <Heading
          fontWeight={600}
          fontSize={{ base: '3xl', sm: '4xl', md: '6xl' }}
          lineHeight={'110%'}>
            Schedule a {' '}
          <Text as={'span'} color={'orange.400'}>
            fixed end time
          </Text>{' '} for Google Meet conferences
        </Heading>
        <Text color={'gray.500'} maxW={'3xl'}>
          Make sure that meetings end when they are supposed to.
        </Text>
          {children}
      </Stack>
    </Container>
      </ChakraProvider>
          </body>
    </html>
  );
}
