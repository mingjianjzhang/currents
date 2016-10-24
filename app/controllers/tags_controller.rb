class TagsController < ApplicationController
	def create
		tags = params[:tags].split(', ')
		tags.each do |tag|
		  new_tag = Tag.new(name: tag.capitalize)
		  if new_tag.save
		    next
		  else 
		  	flash.now[:error] = "That tag already exists"
		  end
		end
		redirect_to :back

	end
	
end
