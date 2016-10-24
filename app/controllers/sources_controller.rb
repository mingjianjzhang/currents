class SourcesController < ApplicationController
	def create
	  source = Source.new(source_params)
	  if source.save
	  	redirect_to :back
	  else
	  	flash[:error] = "whoops"
	  end
	end
	private
	def source_params
		params.require(:sources).permit(:name);
	end
end
