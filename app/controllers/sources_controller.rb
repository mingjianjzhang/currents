class SourcesController < ApplicationController
	def create
	  source = Source.new(source_params)
	  if source.save
	  	render partial: "sources/partials/sources_list", locals: { sources: Source.all }
	  else
	  	flash[:error] = "whoops"
	  end
	end
	private
	def source_params
		params.require(:sources).permit(:name);
	end
end
