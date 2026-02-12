import { Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { APP_STORE_LINKS, PAYMENT_PARTNERS, SOCIAL_LINKS } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About Section */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">About DeshGhuri</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Your trusted travel marketplace with escrow protection, group discounts, and verified
              sellers.
            </p>
            <p className="text-sm text-muted-foreground">
              Book with confidence. Travel with peace of mind.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground transition-colors hover:text-primary">
                  Popular Destinations
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  to="/deals"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Flash Deals
                </Link>
              </li>
              <li>
                <Link
                  to="/group-bookings"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Group Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Customer Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/help"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/track-booking"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Track Booking
                </Link>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">For Sellers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/seller"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Seller Sign In
                </Link>
              </li>
              <li>
                <Link
                  to="/seller/support"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Seller Support
                </Link>
              </li>
              <li>
                <Link
                  to="/seller/dashboard"
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  Merchant Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <Separator className="my-8" />
        <div className="mb-8">
          <h3 className="mb-2 text-lg font-semibold">Subscribe to Our Newsletter</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Get the latest deals, travel tips, and exclusive offers delivered to your inbox.
          </p>
          <div className="flex max-w-md gap-2">
            <Input type="email" placeholder="Enter your email" className="flex-1" />
            <Button>Subscribe</Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            We respect your privacy. Unsubscribe anytime.
          </p>
        </div>

        {/* Payment Partners */}
        <Separator className="my-8" />
        <div className="mb-8">
          <h3 className="mb-4 text-center text-sm font-semibold">Secure Payment Partners</h3>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {PAYMENT_PARTNERS.map((partner) => (
              <div
                key={partner.name}
                className="flex h-12 w-20 items-center justify-center rounded border bg-background p-2"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-full w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* App Download Links */}
        <div className="mb-8 text-center">
          <h3 className="mb-4 text-sm font-semibold">Download Our App (Coming Soon)</h3>
          <div className="flex justify-center gap-4">
            <Link to={APP_STORE_LINKS.playStore}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
                className="h-12"
              />
            </Link>
            <Link to={APP_STORE_LINKS.appStore}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                alt="Download on the App Store"
                className="h-12"
              />
            </Link>
          </div>
        </div>

        {/* Social Media & Legal */}
        <Separator className="my-8" />
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Legal Links */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <Link to="/terms" className="transition-colors hover:text-primary">
              Terms of Service
            </Link>
            <span>•</span>
            <Link to="/privacy" className="transition-colors hover:text-primary">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/refund-policy" className="transition-colors hover:text-primary">
              Refund Policy
            </Link>
            <span>•</span>
            <Link to="/escrow-terms" className="transition-colors hover:text-primary">
              Escrow Terms
            </Link>
          </div>

          {/* Social Media Icons */}
          <div className="flex gap-4">
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href={SOCIAL_LINKS.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href={SOCIAL_LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <Youtube className="h-5 w-5" />
            </a>
            <a
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© 2026 DeshGhuri. All rights reserved.</p>
          <p className="mt-1">Made with ❤️ in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
