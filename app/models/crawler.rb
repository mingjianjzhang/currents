class Crawler
  def obtain(url)
    results = {}
    if url =~ URI::regexp
    	doc = Nokogiri::HTML(open(url))
      if doc.at("meta[property='og:image']")
        results[:image] = doc.at("meta[property='og:image']")['content']
      else
        results[:image] = ""
      end
      if doc.at("meta[property='og:description']")
        results[:description] = doc.at("meta[property='og:description']")['content']
      else
        results[:description] = ""
      end
      if doc.at("meta[property='og:title']")
        results[:title] = doc.at("meta[property='og:title']")['content']
      else 
        results[:title] = ""
      end
    else 
      results[:image] = ""
      results[:description] = ""
      results[:title] = ""
    end
    results
  end
  def world_cat(url)
    doc = Nokogiri::HTML(open(url))
    libraries = doc.css("holding")
    allLibraries = []
    if libraries != []
      libraries.each do |item|
        library = {}
        library[:name] = item.css("physicallocation").text
        library[:location] = item.css("physicaladdress").text
        library[:link] = item.css("electronicaddress").text
        allLibraries << library
      end
    end
    allLibraries
  end
end
