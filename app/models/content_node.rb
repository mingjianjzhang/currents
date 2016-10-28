class ContentNode < ActiveRecord::Base
  belongs_to :category
  belongs_to :source
  belongs_to :image
  has_many :snapshot_nodes
  has_many :snapshots, through: :snapshot_nodes
  has_many :timeline_contents, dependent: :destroy
  has_many :timelines, through: :timeline_contents
  has_many :content_tags, dependent: :destroy
  has_many :tags, through: :content_tags

  # validates :title, :link, :description, :category_id, :source_id, presence: true
  def self.everything timeline_id
  	# content = Timeline.find(timeline_id).content_nodes
    content = self.all_info timeline_id
  # keys = Timeline.find(timeline_id).content_nodes.select("distinct day").order("day")
  	self.new_package content
  end
  def self.this_month timeline_id
  	content = self.all_info timeline_id, "extract(month from day) = #{Time.now.month} AND extract(year from day) = #{Time.now.year}"
  	self.new_package content
  end
  def self.last_six timeline_id
  	month = Time.now.month - 6
  	year = Time.now.year
  	if month <= 0
  	  year = year - 1
  	  month = (month + 12) % 12
    end
    six_months_ago = Date.new(year, month, 1)
  	content = self.all_info timeline_id, "day > '#{six_months_ago}'"
  	self.new_package content
  end
  def self.last_two_years timeline_id
  	content = self.all_info timeline_id, "extract (year from day) >= #{Time.now.year - 2}"
  	self.new_package content
  end
  def self.by_keywords timeline_id, keywords, logic
  	content = self.all_info timeline_id
  	if keywords.length == 1
  	   keyword = Tag.find(keywords.first);
  	   filter = content.select { |item| item.tags.include?keyword}
    else 
       if logic == "0"
       	 filter = content
         keywords.each do |id|
       	   keyword = Tag.find(id)
       	   filter = filter.select { |item| item.tags.include?keyword }
       	 end
       else
       	 filter = []
       	 keywords.each do |id|
       	 	keyword = Tag.find(id)
       	 	values = content.select { |item| item.tags.include?keyword }
       	 	values.each { |value| filter << value unless filter.include? value }
       	 end
       	 filter = filter.sort_by { |item| item.day }
       end
    end    
    self.new_package filter
  end
  def self.by_date_range timeline_id, beg_date, end_date
  	content = self.all_info timeline_id, "day BETWEEN '#{beg_date}' AND '#{end_date}'"
    # .group("content_nodes.id")

  	self.new_package content
  end
  def self.all_info timeline_id, query=""
    Timeline.find(timeline_id).content_nodes.includes(:tags, :source, :image).where(query).order("day")
  end
  def self.package content, keys
  	package = [];
  	keys.each do |key| 
  	  item = {}
      # {date: today, contents: [ content: info, tags: [{name}]] }
  	  holder = []
  	  contents = content.where(day: key.day)
  	  contents.each do |content|
  	    cluster = {}
  	    cluster[:content] = content
  	    cluster[:tags] = content.tags
  	    holder << cluster
  	  end
  	  item[:date] = key.day
  	  item[:contents] = holder
  	  package << item
  	end
  	package
  end
  def self.new_package content
    package = [];
    keys = [];
    content.each do |item|
      keys << item.day if !keys.include?(item.day)
    end
    keys.each do |key|
      item = {}
      holder = []
      contents = content.select { |item| item.day == key }
      contents.each do |content|
        holder << content
      end
      item[:date] = key
      item[:contents] = holder
      package << item
    end
    package
  end
  def self.package_by_month content, keys

  end
  def self.full_display
  end
end


 