class ContentNode < ActiveRecord::Base
  belongs_to :category
  belongs_to :source
  has_many :snapshot_nodes
  has_many :snapshots, through: :snapshot_nodes
  has_many :timeline_contents
  has_many :timelines, through: :timeline_contents
  has_many :content_tags
  has_many :tags, through: :content_tags

  # validates :title, :link, :description, :category_id, :source_id, presence: true
  def self.everything timeline_id
  	content = Timeline.find(timeline_id).content_nodes
  	keys = content.select("distinct day").order("day")
  	self.package content, keys
  end
  def self.this_month timeline_id
  	content = Timeline.find(timeline_id).content_nodes.where("extract(month from day) = #{Time.now.month} AND extract(year from day) = #{Time.now.year}")
  	keys = content.select("distinct day").order("day")
  	self.package content, keys
  end
  def self.last_six timeline_id
  	month = Time.now.month - 6
  	year = Time.now.year
  	if month <= 0
  	  year = year - 1
  	  month = (month + 12) % 12
    end
    six_months_ago = Date.new(year, month, 1)
  	content = Timeline.find(timeline_id).content_nodes.where("day > '#{six_months_ago}'")
  	keys = content.select("distinct day").order("day")
  	self.package content, keys
  end
  def self.last_two_years timeline_id
  	content = Timeline.find(timeline_id).content_nodes.where("extract (year from day) >= #{Time.now.year - 2}")
  	keys = content.select("distinct day").order("day")
  	self.package content, keys
  end
  def self.by_keyword timeline_id, keyword
  	content = Timeline.find(timeline_id).content_nodes.joins(:tags).where("name = '#{keyword}'")
  	keys = content.select("distinct day").order("day")
  	self.package content, keys
  end
  def self.by_keywords timeline_id, keywords

  end

  def self.by_date_range timeline_id, beg_date, end_date
  	content = Timeline.find(timeline_id).content_nodes.where("day BETWEEN '#{beg_date}' AND '#{end_date}'").group("content_nodes.id")
  	keys = content.select("distinct day").order("day")
  	self.package content, keys
  end
  def self.package content, keys
  	package = [];
  	keys.each do |key| 
  	  item = {}
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
  def self.full_display
  	self.select("title, ")
  end
end
 