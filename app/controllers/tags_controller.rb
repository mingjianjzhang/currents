class TagsController < ApplicationController
	def create
		tags = params[:tags].split(', ')
		tags.each do |tag|
		  new_tag = Tag.new(name: tag.capitalize, timeline_id: params[:timeline_id])
		  if new_tag.save
		    next
		  else 
		  	flash.now[:error] = "That tag already exists"
		  end
		end
		render partial: "tags/partials/tags_list", locals: { tags: Tag.where(timeline_id: params[:timeline_id]) }
	end
	
end
 