class Snapshot < ActiveRecord::Base
  belongs_to :timeline
  has_many :snapshot_nodes
  has_many :content_nodes, through: :snapshot_nodes

  validates :title, :day, presence: true

  def self.everything timeline_id
  	snapshots = self.where("timeline_id = #{timeline_id}").select(:id, :title, :day).all.order(:day)
  	self.package snapshots
  end
  def self.this_month timeline_id
  	month = Time.now.month
  	year = Time.now.year
  	this_month = self.where("timeline_id = #{timeline_id} AND extract(month from day) = #{month} AND extract(year from day) = #{year}").all.order(:day);
  	self.package this_month
  end

  def self.last_six timeline_id
  	where_statement = "timeline_id = #{timeline_id} AND "
  	month = Time.now.month - 6
  	if month <= 0
  	  last_year = Time.now.year - 1
  	  where_statement+="(extract(year from day) = #{last_year} OR extract(year from day) = #{Time.now.year}) AND "
  	else
  	  where_statement+="extract(year from day) = #{Time.now.year} AND "
  	end
  	month = (month + 12) % 12
  	where_statement += "extract(month from day) BETWEEN #{month} AND #{Time.now.month}"
  	last_six = self.where(where_statement).all.order(:day)
  	self.package last_six
  end
  def self.last_two_years timeline_id
  	last_two_years = self.where("timeline_id = #{timeline_id} AND extract(year from day) >= #{Time.now.year - 2 }").all.order(:day)
  	self.package last_two_years
  end
  def self.package snapshots
  	package = [];
  	snapshots.each do |snapshot|
  	  item = {} 
  	  item[:snapshot] = snapshot
  	  item[:content] = snapshot.content_nodes
  	  package << item
  	end
  	package
  end



end
 
