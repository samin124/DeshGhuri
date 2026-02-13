import { Link } from '@tanstack/react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockBlogPosts } from '@/lib/mock-data';
import { Calendar, Clock } from 'lucide-react';

export default function BlogPreview() {
  return (
    <section className="bg-background-subtle py-12">
      <div className="mx-auto w-full max-w-7xl px-4 lg:px-6">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold">Travel Stories & Tips</h2>
          <p className="text-muted-foreground">Inspiration for your next adventure</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {mockBlogPosts.map((post) => (
            <Link key={post.id} to={`/blog/${post.id}`}>
              <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={post.image}
                  alt={post.title}
                  className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <CardContent className="p-4">
                  <Badge className="mb-2">{post.category}</Badge>
                  <h3 className="mb-2 font-semibold line-clamp-2 group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
