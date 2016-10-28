class ImagesController < ApplicationController
  def index 
  	crawler = Crawler.new
  	@libraries = crawler.world_cat('http://www.worldcat.org/webservices/catalog/content/libraries/isbn/1616149493?location=92801&wskey=PUNxEzPzoYIVx8v7kvO08ZMDqE9mx7nF6lvQaJ4nZ2aASXHjkUm0Ls1cjC993ND0DPUnhTnpL79f5V4t')
  end
  def create 
  	image = Image.new(image_params)
  	if image.save
  	  render json: image
  	end
  end
  def library_info
    crawler = Crawler.new
    @libraries = crawler.world_cat("http://www.worldcat.org/webservices/catalog/content/libraries/isbn/#{params[:isbn]}?location=#{params[:zip]}&wskey=PUNxEzPzoYIVx8v7kvO08ZMDqE9mx7nF6lvQaJ4nZ2aASXHjkUm0Ls1cjC993ND0DPUnhTnpL79f5V4t")
    render partial: "shared/libraries"
  end


  private
  def image_params
  	params.require(:images).permit(:img_source)
  end

end
