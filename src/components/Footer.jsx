function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-gray-300">
              We are an eCommerce store offering the best products for your needs. Quality and customer satisfaction are our top priorities.
            </p>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-300">Email: support@store.com</p>
            <p className="text-gray-300">Phone: (123) 456-7890</p>
            <p className="text-gray-300">Address: 123 Main St, Springfield, IL</p>
          </div>

          {/* Social Media Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href="#" className="text-gray-300 hover:text-blue-400 transition">
                Facebook
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition">
                Twitter
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition">
                Instagram
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} eCommerce Store. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;