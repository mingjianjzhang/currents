class TagsController < ApplicationController
	def create
		if tags = ""
		  render partial: "tags/partials/tags_list", locals: { tags: Tag.all }
		end
		tags = params[:tags].split(', ')
		tags.each do |tag|
		  new_tag = Tag.new(name: tag.capitalize)
		  if new_tag.save
		    next
		  else 
		  	flash.now[:error] = "That tag already exists"
		  end
		end
		render partial: "tags/partials/tags_list", locals: { tags: Tag.all }
	end
	
end
 