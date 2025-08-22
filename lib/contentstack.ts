import Contentstack, { Region } from '@contentstack/delivery-sdk'  

// Check if required environment variables are set
const apiKey = process.env.NEXT_PUBLIC_CONTENTSTACK_API_KEY;
const deliveryToken = process.env.NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN;
const environment = process.env.NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT || 'production';

if (!apiKey || !deliveryToken) {
  console.warn('⚠️  Contentstack environment variables not configured:');
  console.warn('   For client-side usage, create a .env.local file with:');
  console.warn('   NEXT_PUBLIC_CONTENTSTACK_API_KEY=your_api_key');
  console.warn('   NEXT_PUBLIC_CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token');
  console.warn('   NEXT_PUBLIC_CONTENTSTACK_ENVIRONMENT=your_environment');
}

// Create stack instance only if environment variables are available
const Stack = apiKey && deliveryToken ? Contentstack.stack({
  apiKey: apiKey, 
  deliveryToken: deliveryToken, 
  environment: environment, 
  region: Region.US,
}) : null;

export default Stack; 