
import { notFound } from 'next/navigation';
import Stack from '../../../lib/contentstack';
import { getPageByUrl } from '../../../lib/contentstack-utils';
import ContentCardHeader from '../../components/ContentCardHeader';
import ContentCard from '../../components/ContentCard';
import DummyUserAttr from '../../components/dummyUserAttr';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchPageData(slug: string): Promise<any> {
  if (!Stack) {
    return null;
  }

  try {
    const result = await getPageByUrl(slug, ["content_card_page_header", "content_cards.content_card.info_card"]);
    return result;
  } catch (err) {
    console.warn('Error fetching page data for slug:', slug, err);
    return null;
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function DynamicPage({ params }: PageProps): Promise<any> {
  const { slug } = await params;
  const pageData = await fetchPageData(slug);



  if (!pageData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DummyUserAttr />
      {/* Header Section */}
      <ContentCardHeader data={pageData} />

      {/* Content Cards Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="space-y-6">
            {pageData.content_cards[0].content_card.info_card.map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (card: any, index: number) => (
                <ContentCard
                  key={card.uid || index}
                  data={card}
                  name={card.name}
                  price={card.price}
                  rating={card.rating?.value?.toString() || card.rating?.toString() || '0'}
                  duration={card.duration}
                  location={card.location}
                  group_size={card.group_size}
                  image={card.image}
                  description={card.description || card.info}
                  button_text={card.button_text || card.book_now_btn || 'Book Now'}
                  button_url={card.button_url || '#'}
                  pageSlug={slug}
                />
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}