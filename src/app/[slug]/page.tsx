import React from "react";
import ContentCard from "@/components/ContentCard";
import ContentCardHeader from "@/components/ContentCardHeader";
import { getPageByUrl } from "../../../lib/contentstack-utils";
import NotFound from "@/components/NotFound";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DynamicPage({ params }: PageProps) {
    const { slug } = await params;
    
    try {
        // Fetch all pages and filter by slug
        const pageData = await getPageByUrl(slug, ["content_card_page_header", "header", "content_cards.content_card.info_card"]);
        
        // Filter by slug - match against the url field from Contentstack
        
        // If no page found, show 404
        if (!pageData) {
            return <NotFound slug={slug} />;    
        }
        
        return (
            <div className="page-container">
                {/* Page Header */}
                <ContentCardHeader data={pageData} />
                
                {/* Content Cards */}
                {pageData.content_cards?.map((cardSection: any, index: number) => (
                    <React.Fragment key={`section-${index}`}>
                        {cardSection.content_card.info_card.map((tour: any) => (
                            <ContentCard 
                                key={tour.uid}
                                data={pageData} 
                                name={tour.name} 
                                price={tour.price} 
                                rating={tour.rating?.value?.toString() || '0'} 
                                duration={tour.duration}
                                location={tour.location}
                                group_size={tour.group_size}
                                image={tour.image} 
                                description={tour.info} 
                                button_text={tour.book_now_btn} 
                                button_url="#" 
                            />
                        ))}
                    </React.Fragment>
                ))}
            </div>
        );
    } catch (error) {
        return <NotFound slug={slug} />;
    }
}