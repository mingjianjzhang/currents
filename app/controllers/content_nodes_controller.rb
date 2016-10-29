class ContentNodesController < ApplicationController
  def new
    @categories = Category.all
    @sources = Source.all 
    @tags = Tag.all
  end

  def create
    params.permit!
    @timeline = Timeline.find(params[:timeline_id])
    @categories = Category.all
    @sources = Source.all 
    @keywords = Tag.all
  	content = ContentNode.new(content_nodes_params)
  	if content.save
      TimelineContent.create(content_node_id: content.id, timeline_id: params[:timeline_id])
      if params[:tags]
        ContentTag.add_tags content.id, params[:tags]
      end
  	  render partial: "content_nodes/partials/new", locals: { notice: "You have successfully added a piece of content" }
  	else
      render partial: "content_nodes/partials/new", locals: { alert: content.errors.messages }
    end
  end 
 
  def get_title
    crawler = Crawler.new
    render json: crawler.obtain(params[:url])
  end
  def get_content 
    @timeline = Timeline.find(params[:id])
    @keywords = Tag.where(timeline_id: @timeline.id)
    @categories = Category.all
    @sources = Source.all
    render partial: "content_nodes/partials/new"
  end
  
  private
  def content_nodes_params
  	params.require(:content_nodes).permit(:title, :link, :description, :category_id, :source_id, :image_id, :day)
  end
  def snapshot_nodes_params
  	params.require(:snapshot_nodes).permit(:content_node_id, :snapshot_id)
  end
end

